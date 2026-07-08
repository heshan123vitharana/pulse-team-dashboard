import { usePageContext } from '@/components/hooks/PageContext';

const AppBreadcrumbs = () => {

    const { title, subTitle } = usePageContext();

    return (
        <div className='flex flex-col items-start'>
            <p className='font-bold'>{title}</p>
            <p className='text-xs text-gray-600 dark:text-gray-200'>{subTitle}</p>
        </div>
    );
};

export default AppBreadcrumbs;