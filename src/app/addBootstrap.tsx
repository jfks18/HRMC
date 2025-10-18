"use client";
import React, { useEffect} from 'react'

const AddBootstrap = () => {

  useEffect(() => {
    // import bootstrap JS from node_modules using package path (no leading slash)
    import('bootstrap/dist/js/bootstrap.bundle.min.js').catch(err => {
      console.error('Failed to load bootstrap bundle:', err);
    });
  }, [])


  return <></>
}

export default AddBootstrap