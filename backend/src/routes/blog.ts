import { Hono } from 'hono'
import { supabase } from '../index'

const blog = new Hono()

// GET /api/v1/blog/posts - List published blog posts
blog.get('/posts', async (c) => {
  const { data, error } = await supabase
    .from('cms_content')
    .select('id, title, slug, excerpt, author_id, published_date, metadata, tags, pillar, force_vector, social_image_url')
    .eq('content_type', 'blog')
    .eq('status', 'published')
    .order('published_date', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ posts: data })
})

// GET /api/v1/blog/posts/:slug - Get specific blog post
blog.get('/posts/:slug', async (c) => {
  const slug = c.req.param('slug')

  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('content_type', 'blog')
    .eq('status', 'published')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({ error: 'Post not found' }, 404)
    }
    return c.json({ error: error.message }, 500)
  }

  return c.json({ post: data })
})

// GET /api/v1/blog/pillars - Get unique pillars for filtering
blog.get('/pillars', async (c) => {
  const { data, error } = await supabase
    .from('cms_content')
    .select('pillar')
    .eq('content_type', 'blog')
    .eq('status', 'published')
    .not('pillar', 'is', null)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  const pillars = [...new Set(data.map(item => item.pillar).filter(Boolean))]
  return c.json({ pillars })
})

// GET /api/v1/blog/tags - Get unique tags for filtering
blog.get('/tags', async (c) => {
  const { data, error } = await supabase
    .from('cms_content')
    .select('tags')
    .eq('content_type', 'blog')
    .eq('status', 'published')
    .not('tags', 'is', null)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  const allTags = data.flatMap(item => item.tags || [])
  const tags = [...new Set(allTags)]
  return c.json({ tags })
})

export { blog }