import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";

type ImgProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
} & Omit<ImageProps, "src" | "alt" | "className">;

const Img = ({
  src,
  alt,
  className = "",
  priority = false,
  ...rest
}: ImgProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes="100vw"
      className={cn(`w-full h-fit ${className}`)}
      priority={priority}
      {...rest}
    />
  );
};

export default Img;