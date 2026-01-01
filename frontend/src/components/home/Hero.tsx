import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero-split">
      {/* Men's Side */}
      <div className="split-pane men-pane">
        <img 
          src="https://images.unsplash.com/photo-1506634572416-48cdfe530110?q=80&w=1585&auto=format&fit=crop" 
          alt="Men" 
        />
        <div className="pane-content">
          <h2 className="animate-text">STREET<br/>CULTURE</h2>
          <Link href="/shop?cat=men" className="btn-underline">Shop Men</Link>
        </div>
      </div>
      
      {/* Women's Side */}
      <div className="split-pane women-pane">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1528&auto=format&fit=crop" 
          alt="Women" 
        />
        <div className="pane-content">
          <h2 className="animate-text">MODERN<br/>MUSE</h2>
          <Link href="/shop?cat=women" className="btn-underline">Shop Women</Link>
        </div>
      </div>
    </section>
  );
}
