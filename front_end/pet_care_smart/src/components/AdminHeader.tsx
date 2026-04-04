import { Bell, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const AdminHeader = () => {
    return (
        <header className='fixed top-0 right-0 left-64 h-16 bg-card border-b border-border z-30 px-6 flex items-center justify-between'>
            <div className='flex-1 max-w-xl'>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                    <Input
                        placeholder='Search...'
                        className='pl-10 rounded-xl bg-background'
                    />
                </div>
            </div>

            <div className='flex items-center space-x-4'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='relative rounded-xl'
                >
                    <Bell className='w-5 h-5' />
                    <Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#FFB86F] text-xs'>
                        3
                    </Badge>
                </Button>

                <div className='flex items-center space-x-3 pl-4 border-l border-border'>
                    {/* {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#B490F5] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user?.name.charAt(0)}</span>
            </div>
          )} */}
                    <div>
                        {/* <p className="text-sm font-semibold text-foreground">{user?.name}</p> */}
                        <p className='text-xs text-muted-foreground'>
                            Administrator
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
