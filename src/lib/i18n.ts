import {derived, writable} from 'svelte/store';
import {browser} from '$app/environment';

interface TranslationDictionary {
    languages?: Record<string, string>;
    [key: string]: TranslationValue | Record<string, string> | undefined;
}

type TranslationValue = string | number | boolean | TranslationValue[] | TranslationDictionary;

const translations = {
    de: {
        languageLabel: 'Sprache',
        languages: {
            de: 'Deutsch',
            en: 'Englisch'
        },
        pageTitle: 'WiFi-Login',
        headerTitle: 'Willkommen im ATS-Netzwerk',
        headerDescription:
            'Indem Sie das Netzwerk nutzen, erklären Sie sich damit einverstanden, die folgenden Nutzungsbedingungen einzuhalten. Wenn Sie nicht einverstanden sind, dürfen Sie das Netzwerk nicht nutzen.',
        loginFormTitle: 'Anmeldung im ATS-Netzwerk',
        loginFormDescription: 'Geben Sie Ihren Benutzernamen und Ihr Passwort ein, um sich anzumelden:',
        metaDescription: 'Melden Sie sich beim ATS WLAN-Portal an, um sicheren Internetzugang zu erhalten.',
        logos: {
            atsAlt: 'ATS-Logo',
            opnsenseAlt: 'OPNsense-Logo'
        },
        usernameLabel: 'Benutzername',
        passwordLabel: 'Passwort',
        termsAgreement: {
            prefix: 'Ich stimme den',
            linkText: 'Nutzungsbedingungen',
            suffix: 'zu.'
        },
        loginButton: 'Anmelden',
        anonymousButton: 'Anonym anmelden',
        logoutButton: 'Abmelden',
        errors: {
            zoneConfigMissing: 'Die Zonenkonfiguration ist nicht verfügbar.',
            serverUnavailable: 'Verbindung zum Authentifizierungsserver nicht möglich.',
            authenticationFailed: 'Authentifizierung fehlgeschlagen.',
            anonymousFailed: 'Anmeldung fehlgeschlagen.',
            closeErrorAria: 'Fehler schließen',
            closeErrorTitle: 'Schließen'
        },
        termsLinkLabel: 'Nutzungsbedingungen',
        terms: {
            pageTitle: 'WiFi-Nutzungsbedingungen ATS',
            heading: 'Nutzungsbedingungen für WLAN-Zugriff',
            sections: [
                {
                    title: '1. Gegenstand und Geltungsbereich dieser Nutzungsbedingungen',
                    paragraphs: [
                        'Diese Nutzungsbedingungen regeln Ihre und unsere Rechte und Pflichten im Zusammenhang mit der Nutzung unseres WLAN-Zugangs.'
                    ]
                },
                {
                    title: '2. Unsere Leistungen',
                    list: [
                        '(1) Wir stellen Ihnen in unseren Geschäftsräumen einen Zugang zum Internet in Form eines WLAN-Zugangs ("Hotspot") zur kostenlosen Nutzung zur Verfügung.',
                        '(2) Die Bereitstellung des Hotspots richtet sich nach unseren jeweiligen technischen und betrieblichen Möglichkeiten. Ein Anspruch auf einen funktionsfähigen Hotspot oder eine bestimmte örtliche Abdeckung des Hotspots besteht nicht.',
                        '(3) Wir gewährleisten ferner nicht, dass der Hotspot störungs- und unterbrechungsfrei genutzt werden kann. Auch können wir keine Übertragungsgeschwindigkeiten gewährleisten.',
                        '(4) Wir behalten uns das Recht vor, den Zugang zum Hotspot im Falle notwendiger technischer Reparatur- und Wartungsarbeiten ohne vorherige Ankündigung zu ändern, zu beschränken oder einzustellen.',
                        '(5) Es besteht kein Anspruch darauf, dass bestimmte Dienste über den Hotspot genutzt werden können. So können insbesondere Port-Sperrungen vorgenommen werden. In der Regel wird das Surfen im Internet und das Senden und Empfangen von E-Mails ermöglicht.'
                    ]
                },
                {
                    title: '3. Zugang und Nutzung',
                    list: [
                        '(1) Wir bieten unser WLAN nur für Mitarbeiter/Mitglieder/Schüler/Besondere Gäste unseres Vereins an. Es handelt sich nicht um einen öffentlich zugänglichen Telekommunikationsdienst, sondern um ein internes WLAN für unseren Verein.',
                        '(2) Voraussetzung für eine Nutzung ist, dass Sie sich zuvor für die Nutzung des Hotspots registrieren und/oder die Geltung dieser Nutzungsbedingungen zu Beginn der Nutzung des Hotspots akzeptieren. Dies kann bei Auswahl des Hotspots als WLAN-Netz im Endgerät in der Regel über ein dann abrufbares Registrierungsformular oder eine Begrüßungsseite erfolgen.',
                        '(3) Es besteht kein Anspruch auf Nutzung des Hotspots. Uns steht es frei, den Zugang zum Hotspot jederzeit ohne Angabe von Gründen einzuschränken oder einzustellen.',
                        '(4) Es gilt die jeweils aktuelle Fassung dieser Nutzungsbedingungen, die Ihnen bei der Anmeldung zum Hotspot abrufbar gemacht wird.'
                    ]
                },
                {
                    title: '4. Zugangsdaten',
                    list: [
                        '(1) Sofern Sie im Zuge einer Registrierung Anmeldedaten (wie z.B. Benutzername, Passwort, E-Mail etc.) angegeben haben, sind diese von Ihnen geheim zu halten und unbefugten Dritten nicht zugänglich zu machen.',
                        '(2) Sollten Sie Registrierungsdaten erhalten haben, haben Sie sicherzustellen, dass der Zugang zu und die Nutzung des Hotspots mit Ihren Benutzerdaten ausschließlich durch Sie als Nutzer erfolgt. Sofern Tatsachen vorliegen, die die Annahme begründen, dass unbefugte Dritte von Ihren Zugangsdaten Kenntnis erlangt haben oder erlangen werden, müssen Sie uns unverzüglich informieren.',
                        '(3) Sie haften als Nutzer für jedwede Nutzung und/oder sonstige Aktivität, die unter Ihren Zugangsdaten ausgeführt wird, nach den gesetzlichen Bestimmungen.'
                    ]
                },
                {
                    title: '5. Ihre Pflichten als Nutzer',
                    list: [
                        '(1) Sie sind verpflichtet, etwaige Informationen, die im Rahmen der Nutzung des Dienstes von Ihnen zu Ihrer Person angegeben werden, wahrheitsgemäß zu machen.',
                        '(2) Sie sind verpflichtet, bei der Nutzung unseres Hotspots die geltenden Gesetze einzuhalten.',
                        '(3) Weitere Pflichten, die sich aus anderen Bestimmungen dieser Nutzungsbedingungen ergeben, bleiben unberührt.'
                    ]
                },
                {
                    title: '6. Preise',
                    paragraphs: ['Der Dienst wird kostenlos erbracht.']
                },
                {
                    title: '7. Verfügbarkeit der Leistungen',
                    paragraphs: [
                        'Da unsere Leistungen unentgeltlich erfolgen, haben Sie keinen Anspruch auf die Nutzung des Hotspots. Es steht uns frei, den Zugang zum Hotspot zu jeder Zeit ohne Angabe von Gründen zu beschränken oder zu beenden.'
                    ]
                },
                {
                    title: '8. Verbotene Handlungen',
                    paragraphs: [
                        'Als Nutzer sind Sie verpflichtet, bei der Nutzung des Hotspots die geltenden Gesetze einzuhalten. Es ist insbesondere untersagt, das Angebot zum Abruf oder zur Verbreitung von sitten- oder rechtswidrigen Inhalten zu nutzen.'
                    ]
                },
                {
                    title: '9. Verantwortlichkeit für Inhalte',
                    paragraphs: [
                        'Wir übernehmen keine Verantwortung für die von Ihnen über den Hotspot übermittelten oder verarbeiteten Inhalte. Für diese Inhalte sind ausschließlich Sie verantwortlich.'
                    ]
                },
                {
                    title: '10. Haftungsbeschränkung',
                    paragraphs: [
                        'Wir haften für Vorsatz und grobe Fahrlässigkeit. Für einfache Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht, die zur Erreichung des Vertragszwecks erforderlich ist. Die Haftung ist in diesem Fall auf den vorhersehbaren, vertragstypischen Schaden begrenzt.'
                    ]
                },
                {
                    title: '11. Schlussbestimmungen',
                    paragraphs: [
                        'Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.'
                    ]
                }
            ]
        }
    },
    en: {
        languageLabel: 'Language',
        languages: {
            de: 'German',
            en: 'English'
        },
        pageTitle: 'WiFi Login',
        headerTitle: 'Welcome to the ATS Network',
        headerDescription:
            'By using this network you agree to comply with the following terms of use. If you do not agree, you may not use the network.',
        loginFormTitle: 'Sign in to the ATS Network',
        loginFormDescription: 'Enter your username and password to sign in:',
        metaDescription: 'Sign in to the ATS WiFi portal for secure internet access.',
        logos: {
            atsAlt: 'ATS logo',
            opnsenseAlt: 'OPNsense logo'
        },
        usernameLabel: 'Username',
        passwordLabel: 'Password',
        termsAgreement: {
            prefix: 'I agree to the',
            linkText: 'Terms of Use',
            suffix: '.'
        },
        loginButton: 'Sign in',
        anonymousButton: 'Sign in anonymously',
        logoutButton: 'Sign out',
        errors: {
            zoneConfigMissing: 'Zone configuration is not available.',
            serverUnavailable: 'Unable to connect to the authentication server.',
            authenticationFailed: 'Authentication failed.',
            anonymousFailed: 'Login failed.',
            closeErrorAria: 'Close error message',
            closeErrorTitle: 'Close'
        },
        termsLinkLabel: 'Terms of Use',
        terms: {
            pageTitle: 'ATS WiFi Terms of Use',
            heading: 'Terms of Use for WiFi Access',
            sections: [
                {
                    title: '1. Subject Matter and Scope of These Terms of Use',
                    paragraphs: [
                        'These terms of use govern your rights and obligations and ours in connection with the use of our WiFi access.'
                    ]
                },
                {
                    title: '2. Our Services',
                    list: [
                        '(1) We provide you with access to the internet free of charge in our premises in the form of WiFi access ("hotspot").',
                        '(2) Provision of the hotspot depends on our respective technical and operational capabilities. There is no entitlement to a functioning hotspot or to a particular geographical coverage of the hotspot.',
                        '(3) We also do not guarantee that the hotspot can be used without disruptions or interruptions. Nor can we guarantee any transmission speeds.',
                        '(4) We reserve the right to change, restrict, or discontinue access to the hotspot without prior notice in the event of necessary technical repair and maintenance work.',
                        '(5) There is no entitlement to the use of specific services via the hotspot. In particular, port blocks may be put in place. As a rule, web browsing and sending and receiving emails are enabled.'
                    ]
                },
                {
                    title: '3. Access and Use',
                    list: [
                        '(1) We provide our WiFi only for employees/members/students/special guests of our association. It is not a publicly accessible telecommunications service but an internal WiFi network for our association.',
                        '(2) A prerequisite for use is that you register for use of the hotspot beforehand and/or accept the validity of these terms of use at the start of your use of the hotspot. This can usually be done by selecting the hotspot as the WiFi network on your device and completing the registration form or welcome page that then appears.',
                        '(3) There is no entitlement to use the hotspot. We are free to restrict or discontinue access to the hotspot at any time without giving reasons.',
                        '(4) The version of these terms of use that is current at the time of registration for the hotspot applies.'
                    ]
                },
                {
                    title: '4. Access Data',
                    list: [
                        '(1) If you provide login data during registration (such as username, password, email, etc.), you must keep this information confidential and prevent unauthorized third-party access.',
                        '(2) If you receive registration data, you must ensure that access to and use of the hotspot with your user data is carried out exclusively by you as the user. If there are facts indicating that unauthorized third parties have gained or will gain knowledge of your access data, you must inform us immediately.',
                        '(3) As the user you are liable, in accordance with statutory provisions, for any use or other activity carried out under your access data.'
                    ]
                },
                {
                    title: '5. Your Obligations as a User',
                    list: [
                        '(1) You are obliged to provide truthful personal information that may be requested when using the service.',
                        '(2) You are obliged to comply with applicable laws when using our hotspot.',
                        '(3) Other obligations arising from additional provisions of these terms of use remain unaffected.'
                    ]
                },
                {
                    title: '6. Fees',
                    paragraphs: ['The service is provided free of charge.']
                },
                {
                    title: '7. Availability of Services',
                    paragraphs: [
                        'Because our services are provided free of charge, you have no entitlement to use of the hotspot. We are free to restrict or terminate access to the hotspot at any time without stating reasons.'
                    ]
                },
                {
                    title: '8. Prohibited Actions',
                    paragraphs: [
                        'As a user you are obliged to comply with applicable laws when using the hotspot. In particular, it is prohibited to use the service to retrieve or distribute immoral or unlawful content.'
                    ]
                },
                {
                    title: '9. Responsibility for Content',
                    paragraphs: [
                        'We accept no responsibility for the content transmitted or processed by you via the hotspot. You alone are responsible for this content.'
                    ]
                },
                {
                    title: '10. Limitation of Liability',
                    paragraphs: [
                        'We are liable for intent and gross negligence. In cases of simple negligence we are only liable if an essential contractual obligation, the fulfilment of which is necessary to achieve the purpose of the contract, is breached. In such cases liability is limited to foreseeable, contract-typical damage.'
                    ]
                },
                {
                    title: '11. Final Provisions',
                    paragraphs: [
                        'The law of the Federal Republic of Germany applies. Should individual provisions of these terms of use be or become invalid, the validity of the remaining provisions shall remain unaffected.'
                    ]
                }
            ]
        }
    }
} satisfies Record<string, TranslationDictionary>;

export type LanguageCode = keyof typeof translations;

const supportedLanguages = Object.keys(translations) as LanguageCode[];

const getInitialLanguage = (): LanguageCode => {
    if (browser) {
        const stored = localStorage.getItem('language') as LanguageCode | null;
        if (stored && supportedLanguages.includes(stored)) {
            return stored;
        }

        const navigatorLanguage = navigator.language?.split('-')[0] as LanguageCode | undefined;
        if (navigatorLanguage && supportedLanguages.includes(navigatorLanguage)) {
            return navigatorLanguage;
        }
    }

    return 'de';
};

export const language = writable<LanguageCode>(getInitialLanguage());

if (browser) {
    language.subscribe((value) => {
        localStorage.setItem('language', value);
        document.documentElement?.setAttribute('lang', value);
    });
}

const getNestedValue = (object: TranslationDictionary, path: string): TranslationValue | undefined => {
    const keys = path.split('.');
    let current: unknown = object;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }

    return current as TranslationValue | undefined;
};

export const t = derived(language, ($language) => {
    const dictionary = translations[$language] ?? translations.de;
    return (key: string): TranslationValue | undefined => getNestedValue(dictionary, key);
});

export interface LanguageOption {
    value: LanguageCode;
    label: string;
}

const getLanguageLabel = (code: LanguageCode, dictionary: TranslationDictionary): string => {
    const names = dictionary.languages ?? {};
    const fallback = translations[code]?.languages ?? {};
    return names[code] ?? fallback[code] ?? code;
};

export const languageOptions = derived(language, ($language): LanguageOption[] => {
    const dictionary = translations[$language] ?? translations.de;
    return supportedLanguages.map((code) => ({
        value: code,
        label: getLanguageLabel(code, dictionary)
    }));
});

export const setLanguage = (code: LanguageCode): void => {
    if (supportedLanguages.includes(code)) {
        language.set(code);
    }
};

export type {TranslationDictionary, TranslationValue};
