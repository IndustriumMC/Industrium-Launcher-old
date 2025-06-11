const { Tolgee, InContextTools, FormatSimple, BackendFetch } = window['@tolgee/web'];

export const tolgee = Tolgee()
    .use(InContextTools())
    .use(FormatSimple())
    .use(BackendFetch())
    .init({
        apiKey: 'tgpak_gm2f6zlemfsxg4dgmzyg6n3hniyxamzthfvdg4zqm5tggyq',
        apiUrl: 'https://translation.benzoogataga.com',
        defaultLanguage: 'en',
        observerType: 'text',
        observerOptions: { inputPrefix: '{{', inputSuffix: '}}' },
    });

export default tolgee.run();
