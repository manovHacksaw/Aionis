import Image from "next/image";

type AionisLogoProps = {
  className?: string;
  priority?: boolean;
};

export function AionisLogo({ className = "h-6 w-auto", priority = false }: AionisLogoProps) {
  return (
    <Image
      src="/Aionis-logo.png"
      alt="Aionis"
      width={569}
      height={439}
      quality={100}
      priority={priority}
      className={className}
    />
  );
}
