import { Link } from 'react-router-dom';

interface Props {
    className?: string;
    linkToHome?: boolean;
}

export default function Logo({ className = 'h-9 sm:h-10 w-auto', linkToHome = true }: Props) {
    const img = (
        <img
            src="/logo.png"
            alt="VendXX"
            className={className}
            width={140}
            height={40}
            decoding="async"
        />
    );

    if (linkToHome) {
        return (
            <Link to="/" className="flex-shrink-0 inline-flex items-center">
                {img}
            </Link>
        );
    }

    return img;
}
