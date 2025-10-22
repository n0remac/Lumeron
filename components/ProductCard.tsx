import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
  slug: string;
  title: string;
  imageUrl: string;
  priceCents: number;
};

export default function ProductCard({
  slug,
  title,
  imageUrl,
  priceCents,
}: ProductCardProps) {
  const priceFormatted = (priceCents / 100).toFixed(2);

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="relative h-64">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p className="text-2xl font-bold">${priceFormatted}</p>
        <div className="card-actions justify-end">
          <Link href={`/product/${slug}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
