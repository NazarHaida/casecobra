import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(price);
};

export function constructMetadata({
  title = "CaseCobra - custom high-quality phone cases",
  description = "Custom high-quality phone cases",
  image = "/thumbnail.png",
}: {
  title?: string;
  description?: string;
  image?: string;
} = {}) {
  return {
    title,
    description,
    metadataBase: new URL("https://casecobra-3ur9.vercel.app/"),
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
  };
}
