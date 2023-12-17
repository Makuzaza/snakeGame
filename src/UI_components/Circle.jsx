import React from 'react';

function Circle({id, clickHandler, current}) {
    return (
        <div className={`circle ${current ? 'active' : ''}`}
         onClick={()=>clickHandler(id)}>
        </div>
    );
}

export default Circle;
