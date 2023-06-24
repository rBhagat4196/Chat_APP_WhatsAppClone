import '@/styles/globals.css'
import { UserProvider } from '@/context/authContext'
import { ChatContextProvider } from '@/context/chatContext';
const App  = ({ Component, pageProps })=> {
  return (
    <UserProvider>
      <ChatContextProvider>
      <Component {...pageProps} />
      </ChatContextProvider>
    </UserProvider>
  )
}
export default App;