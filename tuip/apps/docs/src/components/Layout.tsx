import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Pager } from "./Pager";
import { PageToc } from "./PageToc";
import { TocProvider, useTocSections } from "./TocContext";

/**
 * A route change is not a document load, so the browser keeps the scroll offset
 * and the new page opens halfway down. Keyed on `pathname` alone: a `hash`
 * change is the rail jumping to a section, and a `search` change is a component
 * tab — neither should throw the reader back to the top.
 */
function useScrollToTopOnNavigation() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
}

function LayoutBody() {
  const sections = useTocSections();
  useScrollToTopOnNavigation();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-default">
      <Header />
      <div className="flex flex-1 items-start">
        <Sidebar />

        <main className="flex min-w-0 flex-1 justify-center px-8">
          <div className="w-full max-w-[780px] pb-[120px] pt-12">
            <Outlet />
            <Pager />
          </div>
        </main>

        {/* The rail is a companion to the text column, so it disappears before
            the column has to narrow for it. */}
        {sections.length > 0 && (
          <div className="sticky top-[60px] hidden h-[calc(100vh-60px)] overflow-y-auto xl:block">
            <PageToc sections={sections} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Layout() {
  return (
    <TocProvider>
      <LayoutBody />
    </TocProvider>
  );
}
