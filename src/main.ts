import './styles.css'

async function bootstrap(): Promise<void> {
  const { startApp } = await import('./app/bootstrap/startApp')
  startApp(document.querySelector<HTMLDivElement>('#app'))
}

void bootstrap()
