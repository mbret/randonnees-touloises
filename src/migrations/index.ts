import * as migration_20251009_155501_initial from './20251009_155501_initial';
import * as migration_20260818_220352_catch_up_events_gallery_globalpages_contact from './20260818_220352_catch_up_events_gallery_globalpages_contact';
import * as migration_20260818_224653_payload_3_88_schema from './20260818_224653_payload_3_88_schema';
import * as migration_20260819_211700_events_agenda_entries from './20260819_211700_events_agenda_entries';
import * as migration_20260819_225908_posts_program_schedule from './20260819_225908_posts_program_schedule';
import * as migration_20260820_082249_search_schedule from './20260820_082249_search_schedule';

export const migrations = [
  {
    up: migration_20251009_155501_initial.up,
    down: migration_20251009_155501_initial.down,
    name: '20251009_155501_initial',
  },
  {
    up: migration_20260818_220352_catch_up_events_gallery_globalpages_contact.up,
    down: migration_20260818_220352_catch_up_events_gallery_globalpages_contact.down,
    name: '20260818_220352_catch_up_events_gallery_globalpages_contact',
  },
  {
    up: migration_20260818_224653_payload_3_88_schema.up,
    down: migration_20260818_224653_payload_3_88_schema.down,
    name: '20260818_224653_payload_3_88_schema',
  },
  {
    up: migration_20260819_211700_events_agenda_entries.up,
    down: migration_20260819_211700_events_agenda_entries.down,
    name: '20260819_211700_events_agenda_entries',
  },
  {
    up: migration_20260819_225908_posts_program_schedule.up,
    down: migration_20260819_225908_posts_program_schedule.down,
    name: '20260819_225908_posts_program_schedule',
  },
  {
    up: migration_20260820_082249_search_schedule.up,
    down: migration_20260820_082249_search_schedule.down,
    name: '20260820_082249_search_schedule'
  },
];
