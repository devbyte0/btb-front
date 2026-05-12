import HomeClient from "./HomeClient";

export const metadata = {
  title: "Home",
  description: "Barista Training Bangladesh — premium coffee education in Dhaka. Learn espresso, latte art, and cafe business skills from professional baristas.",
  openGraph: {
    title: "Barista Training Bangladesh — Premium Coffee Education",
    description: "Become a world-class barista artist. Hands-on training, latte art mastery, and career support.",
  },
};

export default function Home() {
  return <HomeClient />;
}
