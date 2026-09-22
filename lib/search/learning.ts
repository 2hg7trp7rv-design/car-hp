import { getLearningCourses, LEARNING_STAGES, LEARNING_TOPICS, learningHref, learningLessonText, type LearningCourse } from "@/lib/learning";
import type { SearchDoc } from "@/lib/search/types";

/** The same public-course filter drives navigation, SSR search and its suggestions. */
export function learningSearchDocuments(courses: readonly LearningCourse[] = getLearningCourses()): Array<{ doc: SearchDoc; body: string }> {
  return getLearningCourses(courses).flatMap((course) => course.lessons.map((lesson) => ({
    doc: {
      type: "learn",
      id: `learn:${course.slug}:${lesson.slug}`,
      slug: `${course.slug}/${lesson.slug}`,
      href: learningHref(course.slug, lesson.slug),
      title: lesson.title,
      description: lesson.goal,
      category: LEARNING_STAGES[lesson.stage].label,
      tags: [course.title, LEARNING_TOPICS[course.topic].title],
      date: course.updatedAt,
    },
    body: learningLessonText(lesson),
  })));
}
