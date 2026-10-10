// English UI strings, keyed by the French source text. One file per area of the app.
import account from './en/account';
import common from './en/common';
import explore from './en/explore';
import listing from './en/listing';
import moderation from './en/moderation';
import partners from './en/partners';

export const EN: Record<string, string> = { ...common, ...explore, ...account, ...listing, ...partners, ...moderation };
