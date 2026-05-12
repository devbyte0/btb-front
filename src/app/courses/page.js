import CoursesClient from "./CoursesClient";

export const metadata = {
  title: "Courses",
  description: "Explore barista training courses in Dhaka, Bangladesh. From espresso fundamentals to latte art mastery and cafe business management. Enroll today!",
  openGraph: {
    title: "Barista Courses | Barista Training Bangladesh",
    description: "Professional barista training courses in Dhaka — espresso, latte art, and cafe business.",
  },
};

export default function CoursesPage() {
  return <CoursesClient />;
}
