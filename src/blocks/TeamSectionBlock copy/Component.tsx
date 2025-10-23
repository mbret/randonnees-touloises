import { TeamSection } from '@/components/TeamSection/TeamSection'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const GalleryBlock = async () => {
  const teamDirectory = await getCachedGlobal('teamDirectory', 2)()

  const teamMembers =
    teamDirectory.teamMembers?.map((member) => ({
      ...member,
      media: member.image,
    })) ?? []

  return (
    <div className="container">
      <TeamSection teamMembers={teamMembers} />
    </div>
  )
}
