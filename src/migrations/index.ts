import * as migration_20251009_155501_initial from './20251009_155501_initial';
import * as migration_20260818_220352_catch_up_events_gallery_globalpages_contact from './20260818_220352_catch_up_events_gallery_globalpages_contact';

export const migrations = [
  {
    up: migration_20251009_155501_initial.up,
    down: migration_20251009_155501_initial.down,
    name: '20251009_155501_initial',
  },
  {
    up: migration_20260818_220352_catch_up_events_gallery_globalpages_contact.up,
    down: migration_20260818_220352_catch_up_events_gallery_globalpages_contact.down,
    name: '20260818_220352_catch_up_events_gallery_globalpages_contact'
  },
];
