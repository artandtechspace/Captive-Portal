export function LoginFooter() {
    return (
        <footer className="pointer-events-none fixed bottom-4 right-4">
            <a
                aria-label="Deciso"
                className="pointer-events-auto block group"
                href="https://www.deciso.com"
                rel="noopener noreferrer"
                target="_blank"
            >
                <img alt="Deciso" className="hidden w-96 group-hover:block" src="/src/assets/images/deciso-brand-hover.svg"/>
                <img alt="Deciso" className="block w-96 group-hover:hidden" src="/src/assets/images/deciso-brand.svg"/>
            </a>
        </footer>
    );
}
