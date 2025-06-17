'use strict'

let MemoryHelper = {
  
  create( sizeOrBuffer=4096, memtype=Float32Array ) {
    let helper = Object.create( this )

    // conveniently, buffer constructors accept either a size or an array buffer to use...
    // so, no matter which is passed to sizeOrBuffer it should work.
    Object.assign( helper, {
      heap: new memtype( sizeOrBuffer ),
      list: {},
      freeList: {},

      // if useTail is true, will force MemoryHelper to allocate at end of the
      // heap and skip any freed memory blocks. Useful to force a contiguous
      // block of memory
      useTail:false,
    })

    return helper
  },

  alloc( size, immutable ) {
    let idx = -1

    if( size > this.heap.length ) {
      throw Error( 'Allocation request is larger than heap size of ' + this.heap.length )
    }

    if( this.useTail === false ) {
      for( let key in this.freeList ) {
        let candidate = this.freeList[ key ]

        if( candidate.size >= size ) {
          idx = key

          this.list[ idx ] = { size, immutable, references:1 }

          if( candidate.size !== size ) {
            let newIndex = idx + size,
                newFreeSize

            for( let key in this.list ) {
              if( key > newIndex ) {
                newFreeSize = key - newIndex
                this.freeList[ newIndex ] = newFreeSize
              }
            }
          }

          break
        }
      }
    }

    if( idx !== -1 ) delete this.freeList[ idx ]

    if( idx === -1 ) {
      let keys = Object.keys( this.list ),
          lastIndex

      if( keys.length ) { // if not first allocation...
        lastIndex = parseInt( keys[ keys.length - 1 ] )

        idx = lastIndex + this.list[ lastIndex ].size
      }else{
        idx = 0
      }

      this.list[ idx ] = { size, immutable, references:1 }
    }

    if( idx + size >= this.heap.length ) {
      throw Error( 'No available blocks remain sufficient for allocation request.' )
    }

    return idx
  },

  // this returns the next index that will be use by 
  // memory helper, unless there are freed blcoks available.  
  // if the useTail property is set to true this will return
  // the next block index regardless of any freed blocks.
  getLastUsedIndex() {
    let keys = Object.keys( this.list ),
        idx = 0,
        lastIndex

    if( keys.length ) { // if not first allocation...
      lastIndex = parseInt( keys[ keys.length - 1 ] )

      idx = lastIndex + this.list[ lastIndex ].size
    }

    return idx
  },

  addReference( index ) {
    if( this.list[ index ] !== undefined ) { 
      this.list[ index ].references++
    }
  },

  free( index ) {
    if( this.list[ index ] === undefined ) {
      throw Error( 'Calling free() on non-existing block.' )
    }

    let slot = this.list[ index ]
    if( slot === 0 ) return
    slot.references--

    if( slot.references === 0 && slot.immutable !== true ) {    
      this.list[ index ] = 0

      let freeBlockSize = 0
      for( let key in this.list ) {
        if( key > index ) {
          freeBlockSize = key - index
          break
        }
      }

      this.freeList[ index ] = freeBlockSize
    }
  },
}

module.exports = MemoryHelper
