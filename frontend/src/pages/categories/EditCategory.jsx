import { useParams } from 'react-router-dom'
import CategoryFormPage from './CategoryFormPage'

const Page = () => {
  const { id } = useParams()
  return <CategoryFormPage id={id} />
}

export default Page

