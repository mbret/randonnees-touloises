import Image from 'next/image'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from './ui/item'
import { Post } from '@/payload-types'

const models = [
  {
    name: 'v0-1.5-sm',
    description: 'Everyday tasks and UI generation.',
    image:
      'https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop',
    credit: 'Valeria Reverdo on Unsplash',
  },
  {
    name: 'v0-1.5-lg',
    description: 'Advanced thinking or reasoning.',
    image:
      'https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop',
    credit: 'Michael Oeser on Unsplash',
  },
  {
    name: 'v0-2.0-mini',
    description: 'Open Source model for everyone.',
    image:
      'https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop',
    credit: 'Cherry Laithang on Unsplash',
  },
]

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const BlogCard = ({ data }: { data: CardPostData }) => {
  return (
    <Item variant="outline">
      <ItemHeader>
        <image
          src={model.image}
          alt={model.name}
          width={128}
          height={128}
          className="aspect-square w-full rounded-sm object-cover"
        />
      </ItemHeader>
      <ItemContent>
        <ItemTitle>{model.name}</ItemTitle>
        <ItemDescription>{model.description}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
