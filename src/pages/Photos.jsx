import { useEffect, useState } from 'react';

const Photos = ({ albumId }) => {
  const [allPhotos, setAllPhotos] = useState([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [page, setPage] = useState(1);
  const photosPerPage = 10;

  useEffect(() => {
    fetch(`http://localhost:3000/photos?albumId=${albumId}`)
      .then(res => res.json())
      .then(data => {
        setAllPhotos(data);
        setVisiblePhotos(data.slice(0, photosPerPage));
      });
  }, [albumId]);

  const loadMore = () => {
    const nextPage = page + 1;
    const nextPhotos = allPhotos.slice(0, nextPage * photosPerPage);
    setVisiblePhotos(nextPhotos);
    setPage(nextPage);
  };

  return (
    <div>
      <h4>תמונות באלבום {albumId}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {visiblePhotos.map(photo => (
          <div key={photo.id}>
            <img src={photo.thumbnailUrl} alt={photo.title} style={{ width: '100%' }} />
            <p style={{ fontSize: '0.7em' }}>{photo.title}</p>
          </div>
        ))}
      </div>
      {visiblePhotos.length < allPhotos.length && (
        <button onClick={loadMore} style={{ marginTop: '20px', padding: '10px 20px' }}>
          טען תמונות נוספות...
        </button>
      )}
    </div>
  );
};

export default Photos;