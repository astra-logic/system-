/**
 * Bible §47 / rule 16: generated data is never presented as real factory
 * transactions. The flag comes from the DATA layer, so this cannot be forgotten
 * — a page rendering demo-derived figures cannot render without it.
 */
export function DemoBanner({ isDemo }: { isDemo: boolean }) {
  if (!isDemo) return null;
  return (
    <div className="demo">
      DEMO DATA — these are generated fixtures, not real factory transactions. No figure on this
      page is a claim about any real business.
    </div>
  );
}
