import BookOpenIcon from '@lucide/svelte/icons/book-open';
import BotIcon from '@lucide/svelte/icons/bot';
import ChartPieIcon from '@lucide/svelte/icons/chart-pie';
import FrameIcon from '@lucide/svelte/icons/frame';
import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
import MapIcon from '@lucide/svelte/icons/map';
import SendIcon from '@lucide/svelte/icons/send';
import Settings2Icon from '@lucide/svelte/icons/settings-2';
import SquareTerminalIcon from '@lucide/svelte/icons/square-terminal';

export const signedInNavBar = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminalIcon,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#'
        },
        {
          title: 'Starred',
          url: '#'
        },
        {
          title: 'Settings',
          url: '#'
        }
      ]
    },
    {
      title: 'Models',
      url: '#',
      icon: BotIcon,
      items: [
        {
          title: 'Genesis',
          url: '#'
        },
        {
          title: 'Explorer',
          url: '#'
        },
        {
          title: 'Quantum',
          url: '#'
        }
      ]
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpenIcon,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2Icon,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'Limits',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoyIcon
    },
    {
      title: 'Feedback',
      url: '#',
      icon: SendIcon
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: FrameIcon
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: ChartPieIcon
    },
    {
      name: 'Travel',
      url: '#',
      icon: MapIcon
    }
  ]
};
