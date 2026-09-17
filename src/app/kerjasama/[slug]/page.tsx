import { SubPage, subPageKeys, subPageMetadata } from "@/components/subpage";

export const revalidate = 300;
export const dynamicParams = false;
export const generateStaticParams = () => subPageKeys("kerjasama/").map((slug) => ({ slug }));

type Props = PageProps<"/kerjasama/[slug]">;
export const generateMetadata = async (props: Props) => subPageMetadata(`kerjasama/${(await props.params).slug}`);
export default async function Page(props: Props) {
  return <SubPage pageKey={`kerjasama/${(await props.params).slug}`} />;
}
