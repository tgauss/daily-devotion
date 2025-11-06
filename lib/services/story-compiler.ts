import { LessonContentOutput, StoryManifest, StoryPage } from '@/lib/types/database'

/**
 * Compiles AI-generated lesson content into a Web Story manifest
 * that can be rendered as tappable pages
 */
export class StoryCompiler {
  /**
   * Compile lesson content into a Web Story manifest
   */
  compile(
    lessonContent: LessonContentOutput,
    metadata: {
      title: string
      reference: string
      translation: string
      quizUrl: string
      passageText: string
    }
  ): StoryManifest {
    const pages: StoryPage[] = []

    // 1. Cover page
    pages.push({
      type: 'cover',
      content: {
        title: metadata.title,
        text: metadata.reference,
      }
    })

    // 2. Preview page (intro)
    pages.push({
      type: 'content',
      content: {
        title: 'What You\'re About to Read',
        text: lessonContent.intro,
      }
    })

    // 3. Bible Passage Pages (split if needed)
    // Split passage into chunks of ~600 characters (roughly 100-120 words)
    const passageChunks = this.splitPassageText(metadata.passageText, 600)

    if (passageChunks.length === 1) {
      pages.push({
        type: 'passage',
        content: {
          title: metadata.reference,
          text: passageChunks[0],
        }
      })
    } else {
      passageChunks.forEach((chunk, index) => {
        pages.push({
          type: 'passage',
          content: {
            title: `${metadata.reference} (${index + 1}/${passageChunks.length})`,
            text: chunk,
          }
        })
      })
    }

    // 4. Context pages (if provided)
    if (lessonContent.context.historical) {
      pages.push({
        type: 'content',
        content: {
          title: 'Historical Context',
          text: lessonContent.context.historical,
        }
      })
    }

    if (lessonContent.context.narrative) {
      pages.push({
        type: 'content',
        content: {
          title: 'The Bigger Story',
          text: lessonContent.context.narrative,
        }
      })
    }

    // 5. Message page (body) - split if too long
    const bodyParagraphs = lessonContent.body.split('\n\n')
    if (bodyParagraphs.length > 2) {
      // Split into multiple pages if more than 2 paragraphs
      const midpoint = Math.ceil(bodyParagraphs.length / 2)
      pages.push({
        type: 'content',
        content: {
          title: 'The Message',
          text: bodyParagraphs.slice(0, midpoint).join('\n\n'),
        }
      })
      pages.push({
        type: 'content',
        content: {
          title: 'The Message (cont.)',
          text: bodyParagraphs.slice(midpoint).join('\n\n'),
        }
      })
    } else {
      pages.push({
        type: 'content',
        content: {
          title: 'The Message',
          text: lessonContent.body,
        }
      })
    }

    // 6. Recap page (conclusion)
    pages.push({
      type: 'content',
      content: {
        title: 'Your Next Step',
        text: lessonContent.conclusion,
      }
    })

    // 7. Key takeaways page
    pages.push({
      type: 'takeaways',
      content: {
        title: 'Key Takeaways',
        bullets: lessonContent.key_takeaways,
      }
    })

    // 8. Reflection prompts page
    pages.push({
      type: 'takeaways',
      content: {
        title: 'Reflect on This',
        bullets: lessonContent.reflection_prompts,
      }
    })

    // 9. Discussion questions page (if multiple, may split)
    if (lessonContent.discussion_questions.length > 3) {
      const midpoint = Math.ceil(lessonContent.discussion_questions.length / 2)
      pages.push({
        type: 'takeaways',
        content: {
          title: 'Discussion Questions',
          bullets: lessonContent.discussion_questions.slice(0, midpoint),
        }
      })
      pages.push({
        type: 'takeaways',
        content: {
          title: 'Discussion Questions (cont.)',
          bullets: lessonContent.discussion_questions.slice(midpoint),
        }
      })
    } else {
      pages.push({
        type: 'takeaways',
        content: {
          title: 'Discussion Questions',
          bullets: lessonContent.discussion_questions,
        }
      })
    }

    // 10. Quiz CTA page
    pages.push({
      type: 'cta',
      content: {
        title: 'Test Your Understanding',
        text: 'Ready to see how much you remember? Take a short quiz to reinforce what you\'ve learned.',
        cta: {
          text: 'Start Quiz',
          href: metadata.quizUrl,
        }
      }
    })

    return {
      pages,
      metadata: {
        title: metadata.title,
        reference: metadata.reference,
        translation: metadata.translation,
      }
    }
  }

  /**
   * Split long passage text into readable chunks
   */
  private splitPassageText(text: string, maxChars: number = 600): string[] {
    // If text is short enough, return as-is
    if (text.length <= maxChars) {
      return [text]
    }

    const chunks: string[] = []
    const verses = text.split(/(?=\[\d+\])/g) // Split on verse numbers like [1], [2], etc.

    let currentChunk = ''
    for (const verse of verses) {
      if ((currentChunk + verse).length > maxChars && currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        currentChunk = verse
      } else {
        currentChunk += verse
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
    }

    return chunks.length > 0 ? chunks : [text]
  }

  /**
   * Validate a story manifest
   */
  validate(manifest: StoryManifest): boolean {
    if (!manifest.pages || manifest.pages.length === 0) {
      throw new Error('Story manifest must have at least one page')
    }

    if (!manifest.metadata || !manifest.metadata.title || !manifest.metadata.reference) {
      throw new Error('Story manifest must have metadata with title and reference')
    }

    // Validate each page
    for (const page of manifest.pages) {
      if (!page.type || !page.content) {
        throw new Error('Each page must have type and content')
      }

      switch (page.type) {
        case 'cover':
          if (!page.content.title) {
            throw new Error('Cover page must have title')
          }
          break
        case 'passage':
        case 'content':
          if (!page.content.title || !page.content.text) {
            throw new Error('Content/Passage page must have title and text')
          }
          break
        case 'takeaways':
          if (!page.content.title || !page.content.bullets) {
            throw new Error('Takeaways page must have title and bullets')
          }
          break
        case 'cta':
          if (!page.content.title || !page.content.cta) {
            throw new Error('CTA page must have title and cta')
          }
          break
      }
    }

    return true
  }
}

// Singleton instance
let storyCompiler: StoryCompiler | null = null

export function getStoryCompiler(): StoryCompiler {
  if (!storyCompiler) {
    storyCompiler = new StoryCompiler()
  }
  return storyCompiler
}
