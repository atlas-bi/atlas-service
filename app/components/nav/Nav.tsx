import { cn } from '@/lib/utils';
import { Link, useLoaderData } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import Image from 'remix-image';

import type { loader } from '../root';
import { Links } from './Links';
import { Notifications } from './Notifications';
import { Search } from './Search';
import { UserNav } from './UserNav';

export default function Nav() {
  const requestDropdownMenu = useRef<HTMLDivElement>(null);
  const profileDropdownMenu = useRef<HTMLDivElement>(null);

  //           <div className="navbar-start">
  //             <div className="navbar-item" aria-label="mail">
  //               <span className="icon is-medium is-relative">
  //                 <i className="far fa-lg fa-envelope"></i>
  //                 <span
  //                   title="mail count"
  //                   className="badge"
  //                   id="nav_unread_message_count"
  //                 >
  //                   0
  //                 </span>
  //               </span>
  //               <span className="hide-desktop">Mail</span>
  //             </div>

  //             <div
  //               ref={requestDropdownMenu}
  //               className={`navbar-item has-dropdown ${
  //                 showNewRequestDropdown && 'is-active'
  //               }`}
  //             >
  //               <button
  //                 className="button is-arrowless has-background-white-bis dropdown-button my-auto "
  //                 onClick={(e) => {
  //                   setShowNewRequestDropdown(true);
  //                 }}
  //               >
  //                 <span className="icon mr-2 has-text-gold">
  //                   <FontAwesomeIcon icon={faWandMagicSparkles} />
  //                 </span>
  //                 New Request
  //               </button>

  //               <div className="navbar-dropdown is-boxed">
  //                 {navRequestTypes &&
  //                   navRequestTypes.map((rt: RequestType) => (
  //                     <Link
  //                       key={rt.id}
  //                       className="navbar-item"
  //                       to={`/request/new?type=${rt.id}`}
  //                       onClick={(e) => {
  //                         setShowNewRequestDropdown(false);
  //                       }}
  //                     >
  //                       {rt.menuText || rt.name}
  //                     </Link>
  //                   ))}
  //               </div>
  //             </div>

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <nav className="flex grow items-center justify-between space-x-4 lg:space-x-6 mx-6">
          <Link to="/" className="flex items-center">
            <Image
              loaderUrl="/api/image"
              src="images/logo.svg"
              responsive={[
                {
                  size: {
                    width: 35,
                    height: 35,
                  },
                  placeholder: 'blur',
                  maxWidth: 35,
                },
              ]}
              dprVariants={[1, 3]}
            />
            <h2 className="scroll-m-20 text-2xl font-medium transition-colors m-0 hover:text-slate-900 text-slate-700">
              <span className="mx-2 text-slate-300">/</span>
              requests
            </h2>
          </Link>
          <div className="flex space-x-6">
            <Links />
            <Search />
          </div>
          <div className="flex space-x-6">
            <Notifications />
            <UserNav />
          </div>
        </nav>
      </div>
    </div>
  );
}
