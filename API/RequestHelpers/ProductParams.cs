using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.RequestHelpers
{
    public class ProductParams : PaginationParams
    {
        public int OrderBy { get; set; }
        public int SearchTerm { get; set; }
        public int Types { get; set; }
        public int Brands { get; set; }
    }
}