import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  PhoneIcon,
  TwitterIcon,
  WebhookIcon,
  YoutubeIcon,
} from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Media as MediaType } from '@/payload-types'
import { Media } from '../Media'
import { getInitials } from '@/utilities/getInitials'

export type TeamMember = {
  media?: MediaType | null | number
  name?: string | null
  role?: string | null
  description?: string | null
  socialLinks?:
    | {
        type?:
          | ('facebook' | 'twitter' | 'linkedin' | 'instagram' | 'github' | 'youtube' | 'custom')
          | null
        customName?: string | null
        uri?: string | null
        id?: string | null
      }[]
    | null
    | undefined
  contactLinks?:
    | {
        type?: ('email' | 'phone' | 'whatsapp' | 'telegram' | 'skype' | 'custom') | null
        customName?: string | null
        value?: string | null
        id?: string | null
      }[]
    | null
    | undefined
}

type ContactLink = NonNullable<TeamMember['contactLinks']>[0]

const getIconForSocialLink = (type: NonNullable<TeamMember['socialLinks']>[0]['type']) => {
  switch (type) {
    case 'facebook':
      return <FacebookIcon className="size-5" />
    case 'twitter':
      return <TwitterIcon className="size-5" />
    case 'linkedin':
      return <LinkedinIcon className="size-5" />
    case 'instagram':
      return <InstagramIcon className="size-5" />
    case 'github':
      return <GithubIcon className="size-5" />
    case 'youtube':
      return <YoutubeIcon className="size-5" />
    default:
      return <WebhookIcon className="size-5" />
  }
}

const getIconForContact = (type: ContactLink['type']) => {
  switch (type) {
    case 'email':
      return <MailIcon className="size-4 shrink-0" />
    case 'phone':
      return <PhoneIcon className="size-4 shrink-0" />
    default:
      return <WebhookIcon className="size-4 shrink-0" />
  }
}

/**
 * A contact value is written the way it should read on the card, so the phone
 * href keeps only what a dialer accepts and drops whatever separators were
 * typed between the groups.
 */
const getHrefForContact = (type: ContactLink['type'], value: string | null | undefined) => {
  switch (type) {
    case 'email':
      return `mailto:${value}`
    case 'phone':
      return `tel:${value?.replace(/[^\d+]/g, '') ?? ''}`
    default:
      return value ?? '#'
  }
}

export const TeamSection = ({ teamMembers }: { teamMembers: TeamMember[] }) => {
  return (
    /**
     * Column count keys off the width the page hands the section rather than the
     * viewport, so the section stays fluid and the caller dictates the layout.
     * Thresholds are the same `--container-*` scale the callers cap themselves
     * with, which keeps a narrow column readable wherever it is placed.
     */
    <div className="@container">
      <div className="grid grid-cols-2 gap-4 @xl:grid-cols-3 @xl:gap-6 @2xl:grid-cols-4 @4xl:grid-cols-5 @4xl:gap-y-10 @6xl:grid-cols-6">
        {teamMembers.map((member, index) => (
          <Card
            key={index}
            className="overflow-hidden py-0 shadow-none transition-colors duration-300"
          >
            <CardContent className="px-0">
              <div className="bg-muted aspect-square">
                {member.media ? (
                  <Media
                    resource={member.media}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground text-3xl font-medium">
                      {getInitials(member.name)}
                    </span>
                  </div>
                )}
              </div>
              {/**
               * Every row below the portrait is optional, so each one only
               * renders when it has something to say — an empty paragraph or
               * link row would still claim its slice of the stack spacing.
               */}
              <div className="space-y-2 p-3 @xl:p-4">
                <CardTitle className="text-base break-words">{member.name}</CardTitle>
                <Separator />
                {(member.role || member.description) && (
                  <div className="text-muted-foreground text-sm">
                    {member.role && <p className="mb-1 font-medium">{member.role}</p>}
                    {member.description && <p>{member.description}</p>}
                  </div>
                )}
                {!!member.contactLinks?.length && (
                  <div className="text-muted-foreground flex flex-col gap-1 text-sm">
                    {member.contactLinks.map((contactLink) => (
                      <a
                        key={contactLink.id}
                        href={getHrefForContact(contactLink.type, contactLink.value)}
                        className="hover:text-foreground flex items-center gap-2 transition-colors"
                      >
                        {getIconForContact(contactLink.type)}
                        <span className="min-w-0 break-words">
                          {contactLink.customName || contactLink.value}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
                {!!member.socialLinks?.length && (
                  <div className="flex gap-3">
                    {member.socialLinks.map((socialLink) => (
                      <a href={socialLink.uri ?? '#'} key={socialLink.id}>
                        {getIconForSocialLink(socialLink.type)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
