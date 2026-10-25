# Storage

useStorage and useLocalStorage default to localStorage; useSessionStorage selects sessionStorage. Existing serialized values load before watchers start. Missing keys retain defaults without writing them unless writeDefaults is enabled. Corrupted values retain defaults and report an error, without clobbering the stored bytes.

Persistence is replacement-based. Assign a new object to data.value or explicitly call write() after a nested mutation. Default JSON supports serializable values. A custom serializer must provide read(string): T and write(T): string. Validate external data in read when required. Dates, maps, class instances, cycles and bigint need domain-specific serializers.

Undefined removes the key. Null is persisted as JSON null. remove() removes persistence and restores the in-memory default. reset() restores and persists the default. The default object is held by reference; keep it immutable or supply fresh values when changing state.

Cross-tab StorageEvents update the matching key without echo writes. Same-tab instances are independent; share one returned store if they need shared state. Native session storage events are limited to browsing contexts in the same top-level session. Storage is not a secret store; choose explicitly what to persist.
