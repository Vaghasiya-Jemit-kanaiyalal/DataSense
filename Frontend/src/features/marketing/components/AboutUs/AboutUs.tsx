import styles from './AboutUs.module.css';

const pillars = [
  {
    title: 'Our mission',
    text: 'Help teams go from messy spreadsheets to confident decisions without juggling five different tools.',
  },
  {
    title: 'What we build',
    text: 'An end-to-end workspace for upload, cleaning, visualization, and model-ready datasets — designed for clarity at every step.',
  },
  {
    title: 'How we work',
    text: 'Transparent pipelines you can undo, preview, and export. Your data stays private and under your control.',
  },
];

export default function AboutUs() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>About Us</span>
          <h2 className={styles.title}>
            A calmer way to work with
            <span className={styles.titleAccent}> your data</span>
          </h2>
          <p className={styles.lead}>
            DataSense started as an internship project with a simple goal: give analysts one
            polished place to clean, explore, and prepare data — without the usual friction.
          </p>
          <p className={styles.body}>
            We focus on thoughtful UX, step-by-step cleaning you can trust, and visuals that
            explain what changed in your dataset. Whether you are learning analytics or shipping
            insights for a team, the product is built to stay out of your way.
          </p>
        </div>

        <div className={styles.pillars}>
          {pillars.map((item) => (
            <article key={item.title} className={styles.pillar}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
