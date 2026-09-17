import { SubPage, subPageKeys, subPageMetadata } from "@/components/subpage";

export const revalidate = 300;
export const dynamicParams = false; // anything not in PAGES → 404
export const generateStaticParams = () => subPageKeys().map((slug) => ({ slug }));

type Props = PageProps<"/[slug]">;
export const generateMetadata = async (props: Props) => subPageMetadata((await props.params).slug);
export default async function Page(props: Props) {
  return <SubPage pageKey={(await props.params).slug} />;
}
