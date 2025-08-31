// src/utils/slideParser.ts
import { Slide, Activity } from '../types/presentation';
import { Lecture } from '../types/lecture';
import { splitContentIntoSlides } from './contentProcessor';

export interface ParsedSlideContent {
  title?: string;
  content: string;
  notes?: string;
}

/**
 * Parses individual slide content to extract title, content, and speaker notes
 */
export const parseSlideContent = (rawContent: string): ParsedSlideContent => {
  let content = rawContent.trim();
  let title: string | undefined;
  let notes: string | undefined;

  // Extract speaker notes (content between <!-- NOTES --> and <!-- /NOTES -->)
  const notesMatch = content.match(/<!--\s*NOTES\s*-->([\s\S]*?)<!--\s*\/NOTES\s*-->/i);
  if (notesMatch) {
    notes = notesMatch[1].trim();
    content = content.replace(notesMatch[0], '').trim();
  }

  // Extract title from first heading if it exists
  const headingMatch = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
  if (headingMatch) {
    title = headingMatch[1].trim();
  }

  return {
    title,
    content,
    notes
  };
};

/**
 * Converts lecture content into slides by splitting on the slide marker
 */
export const parseContentIntoSlides = (
  lectureContent: string,
  lectureTitle: string
): Slide[] => {
  if (!lectureContent) return [];

  const slideContents = splitContentIntoSlides(lectureContent);
  
  return slideContents.map((rawContent, index) => {
    const parsed = parseSlideContent(rawContent);
    
    return {
      id: `slide-${index}`,
      title: parsed.title || lectureTitle,
      content: parsed.content,
      type: 'content' as const,
      slideNumber: index + 1,
      totalSlides: slideContents.length,
      notes: parsed.notes
    };
  });
};

/**
 * Converts lecture and activities into presentation slides
 */
export const parseContentToSlides = (
  lecture: Lecture,
  activities: Activity[] = []
): Slide[] => {
  const contentSlides = parseContentIntoSlides(lecture.content, lecture.title);
  
  // If there are activities, add them as additional slides
  const activitySlides: Slide[] = activities.map((activity, index) => ({
    id: `activity-${activity.id}`,
    title: `Activity ${index + 1}`,
    content: `<div class="text-center"><h2>Time for an Activity!</h2><p>Get ready to test your knowledge.</p></div>`,
    type: 'activity' as const,
    slideNumber: contentSlides.length + index + 1,
    totalSlides: contentSlides.length + activities.length,
    activity: activity
  }));

  return [...contentSlides, ...activitySlides];
};

/**
 * Checks if content contains slide markers
 */
export const hasSlideMarkers = (content: string): boolean => {
  return content.includes('---SLIDE---');
};

/**
 * Gets slide count from content
 */
export const getSlideCount = (content: string): number => {
  if (!hasSlideMarkers(content)) return 1;
  return splitContentIntoSlides(content).length;
};