import Link from 'next/link';

function SideNavLink({
  icon,
  title,
  href = '/',
  type = 'link',
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  type?: 'link' | 'button';
  onClick?: () => void;
  active?: boolean;
}) {
  const baseClass =
    'flex items-center w-full py-3 px-4 rounded-lg transition-all duration-200 hover:bg-white/10 hover:text-white';

  const activeClass = active
    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
    : 'text-white/80';

  const finalClassName = `${baseClass} ${activeClass}`;

  if (type === 'link') {
    return (
      <Link href={href} className={finalClassName}>
        <span className="flex items-center">
          {icon}
          <span className="ml-3 font-medium">{title}</span>
        </span>
      </Link>
    );
  }

  return (
    <button className={finalClassName} onClick={onClick}>
      <span className="flex items-center">
        {icon}
        <span className="ml-3 font-medium">{title}</span>
      </span>
    </button>
  );
}

export default SideNavLink;