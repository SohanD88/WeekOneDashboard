import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import {
  Badge,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons'

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from '../api/events'
import type { SchoolEvent } from '../types'
import styles from './CalendarPage.module.css'

type EventType = SchoolEvent['eventType']
type EventPayload = Omit<SchoolEvent, 'id' | 'createdAt' | 'updatedAt'>
type DateLike =
  | Date
  | { toDate: () => Date }
  | { seconds: number; nanoseconds?: number }
  | string
  | number
  | null
  | undefined

interface CalendarEvent extends EventPayload {
  id: string
  createdAt?: Date
  updatedAt?: Date
}

interface EventFormState {
  title: string
  description: string
  eventType: EventType
  startDate: string
  endDate: string
}

const SCHOOL_DAY_START_HOUR = 7
const SCHOOL_DAY_END_HOUR = 17
const HOUR_HEIGHT = 68
const DAYS_IN_WEEK = 7
const GRID_HEIGHT = (SCHOOL_DAY_END_HOUR - SCHOOL_DAY_START_HOUR) * HOUR_HEIGHT

const EVENT_TYPES: EventType[] = ['activity', 'meeting', 'exam', 'holiday', 'other']

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  activity: 'Activity',
  meeting: 'Meeting',
  exam: 'Exam',
  holiday: 'Holiday',
  other: 'Other',
}

const EVENT_TYPE_STYLES: Record<EventType, string> = {
  activity: styles.eventActivity,
  meeting: styles.eventMeeting,
  exam: styles.eventExam,
  holiday: styles.eventHoliday,
  other: styles.eventOther,
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const MONTH_DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})
const MONTH_DAY_YEAR_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

function normalizeDate(value: DateLike): Date {
  if (value instanceof Date) return value

  if (value && typeof value === 'object' && 'toDate' in value) {
    return value.toDate()
  }

  if (value && typeof value === 'object' && 'seconds' in value) {
    return new Date(value.seconds * 1000)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value)
  }

  return new Date()
}

function normalizeEvent(event: SchoolEvent): CalendarEvent {
  const startDate = normalizeDate(event.startDate)
  const rawEndDate = normalizeDate(event.endDate)
  const endDate =
    rawEndDate.getTime() > startDate.getTime()
      ? rawEndDate
      : new Date(startDate.getTime() + 60 * 60 * 1000)
  const eventType = EVENT_TYPES.includes(event.eventType) ? event.eventType : 'other'

  return {
    id: event.id,
    title: event.title || 'Untitled event',
    description: event.description || '',
    eventType,
    startDate,
    endDate,
    createdAt: normalizeDate(event.createdAt),
    updatedAt: normalizeDate(event.updatedAt),
  }
}

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date)
  next.setDate(next.getDate() - next.getDay())
  return next
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * DAYS_IN_WEEK)
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStart, index))
}

function withHour(date: Date, hour: number): Date {
  const next = new Date(date)
  next.setHours(hour, 0, 0, 0)
  return next
}

function isSameDay(first: Date, second: Date): boolean {
  return startOfDay(first).getTime() === startOfDay(second).getTime()
}

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((first, second) => {
    return first.startDate.getTime() - second.startDate.getTime()
  })
}

function formatDateTimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('')
}

function createFormState(startDate: Date): EventFormState {
  const start = new Date(startDate)

  if (
    start.getHours() < SCHOOL_DAY_START_HOUR ||
    start.getHours() >= SCHOOL_DAY_END_HOUR
  ) {
    start.setHours(8, 0, 0, 0)
  }

  start.setMinutes(0, 0, 0)

  const end = new Date(start)
  end.setHours(start.getHours() + 1)

  return {
    title: '',
    description: '',
    eventType: 'activity',
    startDate: formatDateTimeLocal(start),
    endDate: formatDateTimeLocal(end),
  }
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, DAYS_IN_WEEK - 1)
  return `${MONTH_DAY_FORMATTER.format(weekStart)} - ${MONTH_DAY_YEAR_FORMATTER.format(weekEnd)}`
}

function formatEventDate(event: CalendarEvent): string {
  if (isSameDay(event.startDate, event.endDate)) {
    return MONTH_DAY_FORMATTER.format(event.startDate)
  }

  return `${MONTH_DAY_FORMATTER.format(event.startDate)} - ${MONTH_DAY_FORMATTER.format(
    event.endDate,
  )}`
}

function formatEventTime(event: CalendarEvent): string {
  return `${TIME_FORMATTER.format(event.startDate)} - ${TIME_FORMATTER.format(event.endDate)}`
}

function formatHour(hour: number): string {
  return TIME_FORMATTER.format(withHour(new Date(), hour))
}

function eventIntersectsRange(event: CalendarEvent, start: Date, end: Date): boolean {
  return event.endDate.getTime() > start.getTime() && event.startDate.getTime() < end.getTime()
}

function getEventsForDay(day: Date, events: CalendarEvent[]): CalendarEvent[] {
  const dayStart = startOfDay(day)
  const dayEnd = addDays(dayStart, 1)
  return events.filter((event) => eventIntersectsRange(event, dayStart, dayEnd))
}

function getEventBlockStyle(
  event: CalendarEvent,
  day: Date,
  index: number,
): CSSProperties | null {
  const dayStart = withHour(day, SCHOOL_DAY_START_HOUR)
  const dayEnd = withHour(day, SCHOOL_DAY_END_HOUR)
  const eventStart = event.startDate.getTime() > dayStart.getTime() ? event.startDate : dayStart
  const eventEnd = event.endDate.getTime() < dayEnd.getTime() ? event.endDate : dayEnd

  if (eventEnd.getTime() <= dayStart.getTime() || eventStart.getTime() >= dayEnd.getTime()) {
    return null
  }

  const startOffsetHours =
    eventStart.getHours() +
    eventStart.getMinutes() / 60 -
    SCHOOL_DAY_START_HOUR
  const durationHours = Math.max(
    (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60),
    0.5,
  )
  const overlapInset = (index % 3) * 7

  return {
    top: `${Math.max(0, startOffsetHours * HOUR_HEIGHT)}px`,
    height: `${Math.max(42, durationHours * HOUR_HEIGHT - 6)}px`,
    left: `${8 + overlapInset}px`,
    right: `${8 + overlapInset}px`,
    zIndex: 2 + index,
  }
}

function getValidatedPayload(form: EventFormState): EventPayload {
  const title = form.title.trim()
  const description = form.description.trim()
  const startDate = new Date(form.startDate)
  const endDate = new Date(form.endDate)

  if (!title) {
    throw new Error('Please enter an event title.')
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Please enter a valid start and end date.')
  }

  if (endDate.getTime() <= startDate.getTime()) {
    throw new Error('The end date must be after the start date.')
  }

  return {
    title,
    description,
    eventType: form.eventType,
    startDate,
    endDate,
  }
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => startOfWeek(new Date()))
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState<EventFormState>(() => createFormState(new Date()))
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadEvents() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await getEvents()
        if (!isMounted) return
        setEvents(sortEvents(data.map(normalizeEvent)))
      } catch (error) {
        console.error('Error loading school events:', error)
        if (!isMounted) return
        setEvents([])
        setLoadError('School events could not be loaded. Check Firebase and try again.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadEvents()

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const weekDays = useMemo(() => getWeekDays(selectedWeekStart), [selectedWeekStart])
  const visibleWeekEnd = useMemo(() => addDays(selectedWeekStart, DAYS_IN_WEEK), [selectedWeekStart])
  const visibleEvents = useMemo(
    () => events.filter((event) => eventIntersectsRange(event, selectedWeekStart, visibleWeekEnd)),
    [events, selectedWeekStart, visibleWeekEnd],
  )
  const upcomingEvents = useMemo(() => {
    const today = startOfDay(new Date())
    return sortEvents(events.filter((event) => event.endDate.getTime() >= today.getTime())).slice(0, 5)
  }, [events])
  const hourLabels = useMemo(
    () =>
      Array.from(
        { length: SCHOOL_DAY_END_HOUR - SCHOOL_DAY_START_HOUR + 1 },
        (_, index) => SCHOOL_DAY_START_HOUR + index,
      ),
    [],
  )

  function updateForm<K extends keyof EventFormState>(field: K, value: EventFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openCreateDialog(startDate = new Date()) {
    setEditingEvent(null)
    setForm(createFormState(startDate))
    setFormError(null)
    setIsDialogOpen(true)
  }

  function openEditDialog(event: CalendarEvent) {
    setEditingEvent(event)
    setForm({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: formatDateTimeLocal(event.startDate),
      endDate: formatDateTimeLocal(event.endDate),
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  function closeDialog() {
    if (isSaving) return
    setIsDialogOpen(false)
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    let payload: EventPayload

    try {
      payload = getValidatedPayload(form)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Please check the event details.')
      return
    }

    setIsSaving(true)

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload)
        setEvents((current) =>
          sortEvents(
            current.map((item) =>
              item.id === editingEvent.id ? { ...item, ...payload } : item,
            ),
          ),
        )
      } else {
        const id = await createEvent(payload)
        setEvents((current) => sortEvents([...current, { id, ...payload }]))
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving school event:', error)
      setFormError('This event could not be saved. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!editingEvent) return

    const confirmed = window.confirm(`Delete "${editingEvent.title}" from the school calendar?`)
    if (!confirmed) return

    setIsSaving(true)
    setFormError(null)

    try {
      await deleteEvent(editingEvent.id)
      setEvents((current) => current.filter((event) => event.id !== editingEvent.id))
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error deleting school event:', error)
      setFormError('This event could not be deleted. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <Text as="p" size="2" weight="medium" className={styles.kicker}>
            Thomas Jefferson Elementary
          </Text>
          <Heading size="7" as="h1">
            School Calendar
          </Heading>
          <Text as="p" size="2" color="gray" className={styles.headerText}>
            Manage assemblies, exams, holidays, meetings, and school-wide activities.
          </Text>
        </div>

        <Button size="3" onClick={() => openCreateDialog()}>
          <PlusIcon />
          Add Event
        </Button>
      </header>

      <div className={styles.toolbar}>
        <Flex align="center" gap="2" wrap="wrap">
          <IconButton
            aria-label="Previous week"
            variant="soft"
            onClick={() => setSelectedWeekStart((current) => addWeeks(current, -1))}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Button variant="soft" onClick={() => setSelectedWeekStart(startOfWeek(new Date()))}>
            Today
          </Button>
          <IconButton
            aria-label="Next week"
            variant="soft"
            onClick={() => setSelectedWeekStart((current) => addWeeks(current, 1))}
          >
            <ChevronRightIcon />
          </IconButton>
          <Text size="3" weight="bold" className={styles.weekRange}>
            {formatWeekRange(selectedWeekStart)}
          </Text>
        </Flex>

      </div>

      <div className={styles.contentGrid}>
        <Card className={styles.calendarCard}>
          <div className={styles.calendarTitleBar}>
            <div>
              <Heading size="4" as="h2">
                Weekly Schedule
              </Heading>
              <Text as="p" size="2" color="gray">
                Click a day or event to add and update school calendar items.
              </Text>
            </div>
            <Badge variant="soft">{visibleEvents.length} this week</Badge>
          </div>

          {loadError ? (
            <div className={styles.errorBanner} role="alert">
              <Text size="2">{loadError}</Text>
              <Button size="1" variant="soft" onClick={() => setReloadKey((current) => current + 1)}>
                Retry
              </Button>
            </div>
          ) : null}

          {isLoading ? (
            <div className={styles.stateCard}>
              <CalendarIcon />
              <Text weight="medium">Loading school events...</Text>
            </div>
          ) : (
            <div className={styles.calendarScroller}>
              <div className={styles.calendarGrid}>
                <div className={styles.weekHeader}>
                  <div className={styles.timeCorner}>EST</div>
                  {weekDays.map((day) => {
                    const today = isSameDay(day, new Date())

                    return (
                      <button
                        type="button"
                        key={day.toISOString()}
                        className={`${styles.dayHeader} ${today ? styles.dayHeaderToday : ''}`}
                        onClick={() => openCreateDialog(withHour(day, 8))}
                      >
                        <span className={styles.dayName}>{WEEKDAY_FORMATTER.format(day)}</span>
                        <strong className={styles.dayNumber}>{day.getDate()}</strong>
                      </button>
                    )
                  })}
                </div>

                <div className={styles.gridBody}>
                  <div className={styles.timeColumn} style={{ height: GRID_HEIGHT }}>
                    {hourLabels.map((hour, index) => (
                      <span
                        key={hour}
                        className={styles.timeLabel}
                        style={{ top: index * HOUR_HEIGHT }}
                      >
                        {formatHour(hour)}
                      </span>
                    ))}
                  </div>

                  <div className={styles.daysGrid} style={{ height: GRID_HEIGHT }}>
                    {weekDays.map((day) => {
                      const dayEvents = getEventsForDay(day, visibleEvents)
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6

                      return (
                        <div
                          key={day.toISOString()}
                          className={`${styles.dayColumn} ${isWeekend ? styles.weekendColumn : ''}`}
                        >
                          {dayEvents.map((event, index) => {
                            const eventStyle = getEventBlockStyle(event, day, index)
                            if (!eventStyle) return null

                            return (
                              <button
                                type="button"
                                key={`${event.id}-${day.toISOString()}`}
                                className={`${styles.eventBlock} ${EVENT_TYPE_STYLES[event.eventType]}`}
                                style={eventStyle}
                                onClick={() => openEditDialog(event)}
                              >
                                <span className={styles.eventTime}>{formatEventTime(event)}</span>
                                <span className={styles.eventTitle}>{event.title}</span>
                                {event.description ? (
                                  <span className={styles.eventDescription}>{event.description}</span>
                                ) : null}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}

                    {visibleEvents.length === 0 ? (
                      <div className={styles.emptyWeek}>
                        <CalendarIcon />
                        <Text size="2" weight="medium">
                          No events scheduled for this week.
                        </Text>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <aside className={styles.sidePanel}>
          <Card className={styles.upcomingPanel}>
            <Flex align="center" justify="between" mb="3">
              <div>
                <Heading size="4" as="h2">
                  Upcoming Events
                </Heading>
                <Text as="p" size="2" color="gray">
                  Next school-wide dates.
                </Text>
              </div>
              <Badge variant="soft">{upcomingEvents.length}</Badge>
            </Flex>

            {upcomingEvents.length === 0 ? (
              <div className={styles.emptyUpcoming}>
                <CalendarIcon />
                <Text size="2" color="gray">
                  No upcoming events yet.
                </Text>
              </div>
            ) : (
              <div className={styles.upcomingList}>
                {upcomingEvents.map((event) => (
                  <button
                    type="button"
                    key={event.id}
                    className={styles.upcomingCard}
                    onClick={() => openEditDialog(event)}
                  >
                    <span className={`${styles.upcomingIcon} ${EVENT_TYPE_STYLES[event.eventType]}`}>
                      <CalendarIcon />
                    </span>
                    <span className={styles.upcomingCopy}>
                      <span className={styles.upcomingTitle}>{event.title}</span>
                      <span className={styles.upcomingMeta}>
                        {formatEventDate(event)} | {formatEventTime(event)}
                      </span>
                      <span className={styles.upcomingDescription}>
                        {event.description || 'No description provided.'}
                      </span>
                      <Badge size="1" variant="soft">
                        {EVENT_TYPE_LABELS[event.eventType]}
                      </Badge>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}>
        <Dialog.Content maxWidth="520px">
          <Dialog.Title>{editingEvent ? 'Edit Event' : 'Add Event'}</Dialog.Title>
          <Dialog.Description size="2">
            {editingEvent
              ? 'Update this school calendar event.'
              : 'Create a new event for the school calendar.'}
          </Dialog.Description>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.formGroup}>
              <Text size="2" weight="medium">
                Title
              </Text>
              <TextField.Root
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="Family literacy night"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <Text size="2" weight="medium">
                Event Type
              </Text>
              <Select.Root
                value={form.eventType}
                onValueChange={(value) => updateForm('eventType', value as EventType)}
              >
                <Select.Trigger aria-label="Event type" />
                <Select.Content>
                  {EVENT_TYPES.map((eventType) => (
                    <Select.Item key={eventType} value={eventType}>
                      {EVENT_TYPE_LABELS[eventType]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>

            <div className={styles.fieldGrid}>
              <label className={styles.formGroup}>
                <Text size="2" weight="medium">
                  Starts
                </Text>
                <TextField.Root
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(event) => updateForm('startDate', event.target.value)}
                  required
                />
              </label>

              <label className={styles.formGroup}>
                <Text size="2" weight="medium">
                  Ends
                </Text>
                <TextField.Root
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(event) => updateForm('endDate', event.target.value)}
                  required
                />
              </label>
            </div>

            <label className={styles.formGroup}>
              <Text size="2" weight="medium">
                Description
              </Text>
              <TextArea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder="Add details for administrators and staff."
                rows={4}
              />
            </label>

            {formError ? (
              <Text size="2" color="red" role="alert">
                {formError}
              </Text>
            ) : null}

            <Flex align="center" justify="between" gap="3" mt="2" wrap="wrap">
              {editingEvent ? (
                <Button type="button" color="red" variant="soft" onClick={handleDelete} disabled={isSaving}>
                  <TrashIcon />
                  Delete
                </Button>
              ) : (
                <span />
              )}

              <Flex align="center" gap="3">
                <Button type="button" variant="soft" color="gray" onClick={closeDialog} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {editingEvent ? <Pencil1Icon /> : <PlusIcon />}
                  {isSaving ? 'Saving...' : editingEvent ? 'Save Event' : 'Create Event'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </section>
  )
}
