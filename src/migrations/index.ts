import * as migration_20251009_155501_initial from './20251009_155501_initial';
import * as migration_20260818_220352_catch_up_events_gallery_globalpages_contact from './20260818_220352_catch_up_events_gallery_globalpages_contact';
import * as migration_20260818_224653_payload_3_88_schema from './20260818_224653_payload_3_88_schema';
import * as migration_20260819_211700_events_agenda_entries from './20260819_211700_events_agenda_entries';
import * as migration_20260819_225908_posts_program_schedule from './20260819_225908_posts_program_schedule';
import * as migration_20260820_082249_search_schedule from './20260820_082249_search_schedule';
import * as migration_20260821_103725_nav_entries_from_pages from './20260821_103725_nav_entries_from_pages';
import * as migration_20260821_111814_icon_cards_block from './20260821_111814_icon_cards_block';
import * as migration_20260822_091833_media_links_block from './20260822_091833_media_links_block';
import * as migration_20260823_132746_membership_tiers_block from './20260823_132746_membership_tiers_block';
import * as migration_20260823_140300_membership_tier_enable_link from './20260823_140300_membership_tier_enable_link';
import * as migration_20260828_150007_program_registration_status from './20260828_150007_program_registration_status';
import * as migration_20260829_program_availability_and_audience from './20260829_program_availability_and_audience';
import * as migration_20260830_092729_event_start_location from './20260830_092729_event_start_location';
import * as migration_20260830_110506_outing_categories from './20260830_110506_outing_categories';
import * as migration_20260901_143542_outing_category_credential from './20260901_143542_outing_category_credential';

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
    name: '20260820_082249_search_schedule',
  },
  {
    up: migration_20260821_103725_nav_entries_from_pages.up,
    down: migration_20260821_103725_nav_entries_from_pages.down,
    name: '20260821_103725_nav_entries_from_pages',
  },
  {
    up: migration_20260821_111814_icon_cards_block.up,
    down: migration_20260821_111814_icon_cards_block.down,
    name: '20260821_111814_icon_cards_block',
  },
  {
    up: migration_20260822_091833_media_links_block.up,
    down: migration_20260822_091833_media_links_block.down,
    name: '20260822_091833_media_links_block',
  },
  {
    up: migration_20260823_132746_membership_tiers_block.up,
    down: migration_20260823_132746_membership_tiers_block.down,
    name: '20260823_132746_membership_tiers_block',
  },
  {
    up: migration_20260823_140300_membership_tier_enable_link.up,
    down: migration_20260823_140300_membership_tier_enable_link.down,
    name: '20260823_140300_membership_tier_enable_link',
  },
  {
    up: migration_20260828_150007_program_registration_status.up,
    down: migration_20260828_150007_program_registration_status.down,
    name: '20260828_150007_program_registration_status',
  },
  {
    up: migration_20260829_program_availability_and_audience.up,
    down: migration_20260829_program_availability_and_audience.down,
    name: '20260829_program_availability_and_audience',
  },
  {
    up: migration_20260830_092729_event_start_location.up,
    down: migration_20260830_092729_event_start_location.down,
    name: '20260830_092729_event_start_location',
  },
  {
    up: migration_20260830_110506_outing_categories.up,
    down: migration_20260830_110506_outing_categories.down,
    name: '20260830_110506_outing_categories',
  },
  {
    up: migration_20260901_143542_outing_category_credential.up,
    down: migration_20260901_143542_outing_category_credential.down,
    name: '20260901_143542_outing_category_credential'
  },
];
