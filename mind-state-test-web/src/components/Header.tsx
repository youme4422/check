type HeaderProps = {
  subtitle: string;
};

const Header = ({ subtitle }: HeaderProps) => {
  return (
    <header className="px-4 pt-6 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-soft backdrop-blur-sm">
        <p className="text-sm font-semibold tracking-wide text-brand-700">마음 상태 분포 테스트</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">{subtitle}</h1>
      </div>
    </header>
  );
};

export default Header;
