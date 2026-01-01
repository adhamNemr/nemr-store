export default function GenericPage({ params }: { params: any }) {
  return (
    <div className="section-container" style={{ paddingTop: '150px', minHeight: '70vh' }}>
      <h1 style={{ fontWeight: 800, textTransform: 'uppercase' }}>Information Page</h1>
      <hr />
      <div style={{ marginTop: '40px' }}>
        <p>This page is currently being updated with our latest policies and information.</p>
        <p>Please check back soon or contact support for immediate assistance.</p>
      </div>
    </div>
  );
}
