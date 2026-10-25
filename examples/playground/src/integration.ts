import { createApp } from '@usevibejs/ui';
import Fixture from './Fixture.vibe';
let apps: ReturnType<typeof createApp>[] = [];
const unmount = () => {
  for (const app of apps) app.unmount();
  apps = [];
};
const mount = () => {
  unmount();
  apps = ['one', 'two'].map((id) => {
    const app = createApp(Fixture);
    app.mount(`#${id}`);
    return app;
  });
};
Object.assign(window, { __vibeuseFixtures: { mount, unmount } });
mount();
