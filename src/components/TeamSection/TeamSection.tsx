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
import { Fragment } from 'react'

type TeamMember = {
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

const getLinkForContact = (
  type: NonNullable<TeamMember['contactLinks']>[0]['type'],
  value: string | null | undefined,
) => {
  switch (type) {
    case 'email':
      return <a href={`mailto:${value}`}>{<MailIcon className="size-5" />}</a>
    case 'phone':
      return <a href={`tel:${value}`}>{<PhoneIcon className="size-5" />}</a>
    default:
      return <a href={value ?? '#'}>{<WebhookIcon className="size-5" />}</a>
  }
}
export const TeamSection = ({ teamMembers }: { teamMembers: TeamMember[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10 xl:grid-cols-5">
      {teamMembers.map((member, index) => (
        <Card
          key={index}
          className="overflow-hidden py-0 shadow-none transition-colors duration-300"
        >
          <CardContent className="px-0">
            <div className="bg-muted aspect-square">
              <Media
                resource={member.media}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover object-top"
              />
            </div>
            <div className="space-y-3 p-4">
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <Separator />
              <div className="text-muted-foreground">
                <p className="mb-1 font-medium">{member.role}</p>
                <p>{member.description}</p>
              </div>
              <div className="flex gap-3">
                {member.contactLinks?.map((contactLink) => (
                  <Fragment key={contactLink.id}>
                    {getLinkForContact(contactLink.type, contactLink.value)}
                  </Fragment>
                ))}
                {member.socialLinks?.map((socialLink) => (
                  <a href={socialLink.uri ?? '#'} key={socialLink.id}>
                    {getIconForSocialLink(socialLink.type)}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
