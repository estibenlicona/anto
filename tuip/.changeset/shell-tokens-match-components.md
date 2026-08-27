---
"@tuya-ui/tokens": patch
---

Los tokens del shell (`shell.railWidth`, `shell.railCollapsedWidth`, `shell.topBarHeight`) pasan de 264px / 68px / 64px a **248px / 64px / 56px**, que son las medidas que `Navbar`, `Sidebar` y `AppShell` ya renderizan y que los canvases aprobados fijan.

Los tres valores anteriores venían de un borrador previo y ningún componente los consumía; el único lector era la tabla de «Shell de aplicación» en Fundamentos, que por eso documentaba un shell que nadie publicaba. Con este cambio la documentación y los componentes vuelven a decir lo mismo. Las CSS Variables `--size-shell-*` cambian de valor; ninguna cambia de nombre.
