/** The home scene is separate from game maps and can gain other themes later. */
export default function HomeBackdrop() {
  return <div className="home-scenery" aria-hidden="true">
    <picture>
      <source media="(max-width: 680px)" srcSet="/art/kiwi-islands-mobile-v1.png" />
      <img src="/art/kiwi-islands-v1.png" width="1536" height="1024" alt="" fetchPriority="high" />
    </picture>
  </div>;
}
