import { Tolgee, FormatSimple, DevTools, BackendFetch } from '@tolgee/web';

export const tolgee = Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .use(BackendFetch())
    .init({
        apiKey: 'tgpak_gm2f6zlemfsxg4dgmzyg6n3hniyxamzthfvdg4zqm5tggyq',
        apiUrl: 'https://translation.benzoogataga.com',
        defaultLanguage: 'en',
        observerType: 'text',
        observerOptions: { inputPrefix: '{{', inputSuffix: '}}' }
    });

export const t = (key, params) => tolgee.t(key, params);

export async function runTolgee() {
    try {
        await tolgee.run();
    } catch (e) {
        console.error('Tolgee initialization failed', e);
    }
}
