import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Store, Loader2, Bookmark, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscription } from "@/lib/SubscriptionContext";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import MarketplaceDetail from "@/components/marketplace/MarketplaceDetail";
import MarketplaceHero from "@/components/marketplace/MarketplaceHero";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import CompanyCollections from "@/components/marketplace/CompanyCollections";
import ExecutiveBundles from "@/components/marketplace/ExecutiveBundles";
import { getRecommendations, searchItems } from "@/lib/marketplaceRecommend";

export default function Marketplace() {
  const { profile, loading: loadingProfile } = useSubscription();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sort, setSort] = useState("trending");
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeBundle, setActiveBundle] = useState(null);
  const [selected, setSelected] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistRecords, setWishlistRecords] = useState({});
  const [purchasedIds, setPurchasedIds] = useState(new Set());

  const isEnterprise = !!profile?.organization_id;

  useEffect(() => {
    Promise.all([
      base44.entities.MarketplaceItem.list("sort_order", 200).catch(() => []),
      base44.entities.Wishlist.list().catch(() => []),
      base44.entities.Purchase.list().catch(() => []),
    ]).then(([allItems, wish, purch]) => {
      setItems(allItems);
      setWishlistIds(new Set(wish.map((w) => w.item_id)));
      setWishlistRecords(Object.fromEntries(wish.map((w) => [w.item_id, w])));
      setPurchasedIds(new Set(purch.map((p) => p.item_id)));
      setLoading(false);
    });
  }, []);

  const toggleSave = async (item) => {
    if (wishlistIds.has(item.id)) {
      try {
        await base44.entities.Wishlist.delete(wishlistRecords[item.id].id);
        setWishlistIds((prev) => { const n = new Set(prev); n.delete(item.id); return n; });
      } catch (e) {}
    } else {
      try {
        const rec = await base44.entities.Wishlist.create({ item_id: item.id, item_title: item.title });
        setWishlistIds((prev) => new Set(prev).add(item.id));
        setWishlistRecords((prev) => ({ ...prev, [item.id]: rec }));
      } catch (e) {}
    }
  };

  const recommendations = useMemo(() => getRecommendations(items, profile, 8), [items, profile]);

  const trending = useMemo(() => items.filter((i) => i.trending).slice(0, 8), [items]);
  const recent = useMemo(
    () => [...items].sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)).slice(0, 8),
    [items]
  );
  const savedItems = useMemo(() => items.filter((i) => wishlistIds.has(i.id)), [items, wishlistIds]);
  const continueLearning = useMemo(() => items.filter((i) => purchasedIds.has(i.id)).slice(0, 8), [items, purchasedIds]);
  const collections = useMemo(() => [...new Set(items.map((i) => i.collection).filter(Boolean))], [items]);
  const bundles = useMemo(() => items.filter((i) => i.is_bundle), [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (activeCollection) result = result.filter((i) => (i.collection || "").toLowerCase() === activeCollection.toLowerCase());
    if (activeBundle) result = result.filter((i) => i.bundle_id === activeBundle);
    if (category !== "all") result = result.filter((i) => i.type === category);
    if (difficulty !== "all") result = result.filter((i) => i.difficulty === difficulty);
    if (priceFilter === "free") result = result.filter((i) => i.price === 0);
    if (priceFilter === "paid") result = result.filter((i) => i.price > 0);
    if (search) result = searchItems(result, search);
    const sorted = [...result].sort((a, b) => {
      if (sort === "trending") return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || (b.downloads || 0) - (a.downloads || 0);
      if (sort === "newest") return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "downloads") return (b.downloads || 0) - (a.downloads || 0);
      return 0;
    });
    return sorted;
  }, [items, search, category, difficulty, priceFilter, sort, activeCollection, activeBundle]);

  const isFiltering = search || category !== "all" || difficulty !== "all" || priceFilter !== "all" || activeCollection || activeBundle;
  const relatedItems = selected ? items.filter((i) => i.id !== selected.id && (i.category === selected.category || i.collection === selected.collection)).slice(0, 4) : [];

  const selectBundle = (bundle) => {
    setActiveBundle(bundle.bundle_id || bundle.id);
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading || loadingProfile) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Store size={12} className="text-indigo-400" /> EXECLEAD Marketplace™ 2.0
          </div>
          <h1 className="text-2xl font-bold text-white">Executive Knowledge Ecosystem</h1>
          <p className="text-white/40 text-sm mt-1">AI-powered learning paths, company collections, interview packs, playbooks & frameworks.</p>
        </div>
      </div>

      {/* Hero + AI Recommendations (only when not filtering) */}
      {!isFiltering && (
        <MarketplaceHero
          profile={profile}
          recommendations={recommendations}
          onSelect={setSelected}
          isEnterprise={isEnterprise}
          wishlistIds={wishlistIds}
          onToggleSave={toggleSave}
          purchasedIds={purchasedIds}
        />
      )}

      {/* Filters */}
      <MarketplaceFilters
        search={search} setSearch={setSearch}
        category={category} setCategory={setCategory}
        difficulty={difficulty} setDifficulty={setDifficulty}
        priceFilter={priceFilter} setPriceFilter={setPriceFilter}
        sort={sort} setSort={setSort}
        activeCollection={activeCollection} onClearCollection={() => setActiveCollection(null)}
        activeBundle={activeBundle} onClearBundle={() => setActiveBundle(null)}
      />

      {/* Main content grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Store size={32} className="mx-auto text-white/10 mb-4" />
          <h3 className="text-white font-medium mb-1">No Marketplace content is available yet.</h3>
          <p className="text-white/30 text-sm mb-6">Try adjusting your search or browse categories.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => { setSearch(""); setCategory("all"); setDifficulty("all"); setPriceFilter("all"); setActiveCollection(null); setActiveBundle(null); }}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors">
              Browse Categories
            </button>
          </div>
        </div>
      ) : isFiltering ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <MarketplaceCard key={item.id} item={item} onClick={() => setSelected(item)}
              isEnterprise={isEnterprise} isSaved={wishlistIds.has(item.id)} onToggleSave={toggleSave}
              isPurchased={purchasedIds.has(item.id)} />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Continue Learning */}
          {continueLearning.length > 0 && (
            <Section title="Continue Learning" icon={<Bookmark size={14} className="text-white/40" />}>
              <Grid items={continueLearning} onSelect={setSelected} isEnterprise={isEnterprise} wishlistIds={wishlistIds} onToggleSave={toggleSave} purchasedIds={purchasedIds} />
            </Section>
          )}

          {/* Company Collections */}
          <CompanyCollections availableCollections={collections} onSelect={(c) => { setActiveCollection(c); window.scrollTo({ top: 300, behavior: "smooth" }); }} />

          {/* Executive Bundles */}
          <ExecutiveBundles bundles={bundles} onSelect={selectBundle} />

          {/* Trending */}
          {trending.length > 0 && (
            <Section title="Trending Executive Content" icon={<Sparkles size={14} className="text-white/40" />}>
              <Grid items={trending} onSelect={setSelected} isEnterprise={isEnterprise} wishlistIds={wishlistIds} onToggleSave={toggleSave} purchasedIds={purchasedIds} />
            </Section>
          )}

          {/* Recently Released */}
          <Section title="Recently Released">
            <Grid items={recent} onSelect={setSelected} isEnterprise={isEnterprise} wishlistIds={wishlistIds} onToggleSave={toggleSave} purchasedIds={purchasedIds} />
          </Section>

          {/* Saved Items */}
          {savedItems.length > 0 && (
            <Section title="Saved Items" icon={<Bookmark size={14} className="text-white/40" />}>
              <Grid items={savedItems} onSelect={setSelected} isEnterprise={isEnterprise} wishlistIds={wishlistIds} onToggleSave={toggleSave} purchasedIds={purchasedIds} />
            </Section>
          )}

          {/* All Content */}
          <Section title="Browse All Content">
            <Grid items={items} onSelect={setSelected} isEnterprise={isEnterprise} wishlistIds={wishlistIds} onToggleSave={toggleSave} purchasedIds={purchasedIds} />
          </Section>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <MarketplaceDetail
            item={selected}
            onClose={() => setSelected(null)}
            isEnterprise={isEnterprise}
            isSaved={wishlistIds.has(selected.id)}
            onToggleSave={toggleSave}
            isPurchased={purchasedIds.has(selected.id)}
            relatedItems={relatedItems}
            onSelectRelated={setSelected}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ items, onSelect, isEnterprise, wishlistIds, onToggleSave, purchasedIds }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <MarketplaceCard key={item.id} item={item} onClick={() => onSelect(item)}
          isEnterprise={isEnterprise} isSaved={wishlistIds.has(item.id)} onToggleSave={onToggleSave}
          isPurchased={purchasedIds.has(item.id)} />
      ))}
    </div>
  );
}