export default function AboutPage() {
  return (
    <div className="section-container" style={{ paddingTop: '150px', maxWidth: '800px' }}>
      <h1 style={{ fontWeight: 800, fontSize: '3.5rem', marginBottom: '40px' }}>Our Story</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: 1.8 }}>
        Founded with a vision to redefine the digital fashion landscape, NEMR is more than just a marketplace. We are a destination for those who appreciate the intersection of minimalist design and high-end street culture.
      </p>
      <div style={{ margin: '60px 0' }}>
        <img 
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop" 
          alt="Editorial" 
          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
        />
      </div>
      <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.7 }}>
        We curate collections that speak to the "Modern Muse" and the "Street Gentleman," ensuring that every piece added to our grid meets a strict standard of aesthetic excellence. 
      </p>
    </div>
  );
}
