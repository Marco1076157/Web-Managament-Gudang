import { useParams } from 'react-router-dom'
import MerchantFormPage from './MerchantFormPage'

const Page = () => {
  const { id } = useParams()
  return <MerchantFormPage id={id} />
}

export default Page

