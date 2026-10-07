import { useParams } from 'react-router-dom'
import ProductFormPage from './ProductFormPage'

const Page = () => {
  const { id } = useParams()
  return <ProductFormPage id={id} />
}

export default Page

